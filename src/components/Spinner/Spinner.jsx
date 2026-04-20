import './Spinner.css'

const sizeClassMap = {
  sm: 'spinner--sm',
  md: 'spinner--md',
  lg: 'spinner--lg',
}

export default function Spinner({ size = 'md', label = 'Loading...' }) {
  return (
    <span
      className={`spinner ${sizeClassMap[size] || sizeClassMap.md}`}
      role="status"
      aria-label={label}
    />
  )
}
