import { useState, useRef, useEffect, Children, cloneElement, isValidElement } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

const Select = ({
    label,
    name,
    id,
    value = '',
    onChange,
    children,
    required,
    placeholder = 'Select option',
    error,
    disabled = false,
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const selectRef = useRef(null)
    const selectId = id || name

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (selectRef.current && !selectRef.current.contains(e.target)) setIsOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const childrenArray = Children.toArray(children)
    const selectedOption = childrenArray.find(child => isValidElement(child) && child.props.value === value)
    const displayLabel = selectedOption ? selectedOption.props.children : placeholder

    return (
        <div className={`flex flex-col gap-1.5 w-full relative ${className}`} ref={selectRef}>
            {label && (
                <label htmlFor={selectId} className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400 ml-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="relative">
                <button
                    type="button"
                    id={selectId}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className={`w-full px-4 py-3 rounded-2xl border text-sm font-bold text-left flex items-center justify-between transition-all duration-300 ${disabled
                            ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400'
                            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white hover:border-violet-500'
                        } ${error ? 'border-red-500 bg-red-50/10' : ''} ${isOpen ? 'border-violet-600 ring-4 ring-violet-500/10' : ''}`}
                >
                    <span className={`truncate ${!value ? 'opacity-40 font-normal' : ''}`}>{displayLabel}</span>
                    <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute left-0 right-0 top-full mt-2 z-[999] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="max-h-60 overflow-y-auto p-1.5 custom-scrollbar">
                                {childrenArray.map((child) =>
                                    isValidElement(child) ? cloneElement(child, {
                                        onClick: () => { onChange(child.props.value); setIsOpen(false); },
                                        active: value === child.props.value
                                    }) : null
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {error && <p className="text-red-500 text-[10px] font-bold ml-1 mt-1 uppercase">{error}</p>}
        </div>
    )
}

export const SelectOption = ({ children, onClick, active }) => (
    <div
        onClick={onClick}
        className={`px-4 py-2.5 text-xs font-bold rounded-xl cursor-pointer transition-all mb-0.5 last:mb-0 ${active ? 'bg-violet-600 text-white shadow-lg' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
    >
        {children}
    </div>
)

export default Select