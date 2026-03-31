import cv2
import numpy as np
from insightface.app import FaceAnalysis
import asyncio
from concurrent.futures import ThreadPoolExecutor
from collections import defaultdict

_face_app = None
_executor = ThreadPoolExecutor(max_workers=2)

def _get_face_app():
    global _face_app
    if _face_app is None:
        _face_app = FaceAnalysis(name="buffalo_l", allowed_modules=['detection', 'recognition'])
        _face_app.prepare(ctx_id=0, det_size=(640, 640))
    return _face_app

def _compute_laplacian_variance(gray):
    return float(cv2.Laplacian(gray, cv2.CV_64F).var())

def _compute_lbp_entropy(gray):
    lbp = np.zeros_like(gray)
    for dy, dx in [(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]:
        shifted = np.roll(np.roll(gray, dy, axis=0), dx, axis=1)
        lbp += (gray >= shifted).astype(np.uint8)
    hist, _ = np.histogram(lbp, bins=256, range=(0, 256))
    hist = hist.astype(float) / (hist.sum() + 1e-8)
    entropy = -np.sum(hist[hist > 0] * np.log2(hist[hist > 0]))
    return float(entropy)

def _is_live_face(face_crop):
    if face_crop.shape[0] < 40 or face_crop.shape[1] < 40:
        return False
    gray = cv2.cvtColor(face_crop, cv2.COLOR_BGR2GRAY)
    return _compute_lbp_entropy(gray) > 3.5 and _compute_laplacian_variance(gray) > 30

def _batch_cosine_sim(detected, stored):
    d_norm = detected / (np.linalg.norm(detected, axis=1, keepdims=True) + 1e-8)
    s_norm = stored / (np.linalg.norm(stored, axis=1, keepdims=True) + 1e-8)
    return d_norm @ s_norm.T

def _extract_embedding_sync(image_bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return None
    app = _get_face_app()
    faces = app.get(img)
    if not faces:
        return None
    face = max(faces, key=lambda f: (f.bbox[2]-f.bbox[0]) * (f.bbox[3]-f.bbox[1]))
    return face.embedding.tolist()

def _process_frames_sync(frames_bytes, stored_embeddings):
    if not stored_embeddings:
        return {"error": "No stored embeddings"}

    frames = []
    for fb in frames_bytes:
        nparr = np.frombuffer(fb, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is not None:
            frames.append(img)

    if not frames:
        return {"error": "No valid frames"}

    scored = [(f, cv2.Laplacian(cv2.cvtColor(f, cv2.COLOR_BGR2GRAY), cv2.CV_64F).var()) for f in frames]
    scored.sort(key=lambda x: x[1], reverse=True)
    best_frames = [f for f, _ in scored[:10]]

    app = _get_face_app()
    stored_matrix = np.array([s["embedding"] for s in stored_embeddings])
    best_scores = defaultdict(float)
    spoof_attempts = 0
    total_faces_detected = 0

    for frame in best_frames:
        faces = app.get(frame)
        if not faces:
            continue

        for face in faces:
            
            total_faces_detected += 1
            detected_emb = face.embedding.reshape(1, -1)
            sims = _batch_cosine_sim(detected_emb, stored_matrix)[0]

            for idx, sim in enumerate(sims):
                sid = stored_embeddings[idx]["student_id"]
                if sim > best_scores[sid]:
                    best_scores[sid] = float(sim)

    THRESHOLD_PRESENT = 0.38 
    THRESHOLD_REVIEW = 0.30

    results = []
    for s in stored_embeddings:
        sid = s["student_id"]
        score = best_scores.get(sid, 0.0)
        
        if score >= THRESHOLD_PRESENT:
            status = "present"
        elif score >= THRESHOLD_REVIEW:
            status = "review"
        else:
            status = "absent"
            
        results.append({
            "student_id": sid, 
            "status": status, 
            "confidence": round(score, 4)
        })

    return {
        "results": results,
        "spoof_attempts": spoof_attempts,
        "frames_processed": len(best_frames),
        "faces_detected": total_faces_detected
    }

async def extract_embedding(image_bytes: bytes):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_executor, _extract_embedding_sync, image_bytes)

async def process_frames(frames_bytes: list, stored_embeddings: list):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_executor, _process_frames_sync, frames_bytes, stored_embeddings)