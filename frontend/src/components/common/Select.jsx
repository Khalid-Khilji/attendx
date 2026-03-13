import { useState, useRef, useEffect, Children, cloneElement } from 'react'
import { ChevronDown } from 'lucide-react'

const Select = ({
    label,
    name,
    value,
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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = (val) => {
        onChange(val)
        setIsOpen(false)
    }

    const selectedOption = Children.toArray(children).find(
        (child) => child.props.value === value
    )

    const displayLabel = selectedOption ? selectedOption.props.children : placeholder

    return (
        <div className={`flex flex-col gap-1 w-full ${className}`} ref={selectRef}>
            {label && (
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className={`
                        w-full px-4 py-2.5 rounded-xl border text-sm font-bold text-left
                        flex items-center justify-between gap-2 transition-all duration-200
                        ${disabled
                            ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-black dark:text-white hover:border-violet-400 dark:hover:border-violet-500 cursor-pointer'
                        }
                        ${error ? 'border-red-300 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20' : ''}
                        ${isOpen ? 'border-violet-600 dark:border-violet-400 ring-4 ring-violet-500/5' : ''}
                        focus:outline-none
                    `}
                >
                    <span className={`truncate ${!value ? 'text-gray-400 dark:text-gray-500 font-normal' : ''}`}>
                        {displayLabel}
                    </span>
                    <ChevronDown
                        size={18}
                        className={`transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''} ${disabled ? 'text-gray-400' : 'text-gray-500'}`}
                    />
                </button>

                {isOpen && !disabled && (
                    <div className="absolute z-50 w-full mt-1 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        <div className="max-h-60 overflow-y-auto hide-scrollbar">
                            <div
                                onClick={() => handleSelect('')}
                                className="px-4 py-2.5 text-sm text-gray-400 dark:text-gray-500 hover:bg-violet-50 dark:hover:bg-violet-950/30 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800"
                            >
                                {placeholder}
                            </div>
                            {Children.map(children, (child) =>
                                cloneElement(child, {
                                    onClick: () => handleSelect(child.props.value),
                                    active: value === child.props.value
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <p className="text-red-500 text-[11px] font-bold ml-1 mt-0.5">{error}</p>
            )}
        </div>
    )
}

export const SelectOption = ({ value, children, onClick, active }) => (
    <div
        onClick={onClick}
        className={`px-4 py-2.5 text-sm transition-colors cursor-pointer
            ${active
                ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 font-bold'
                : 'text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-950/30'
            }
        `}
    >
        {children}
    </div>
)

export default Select