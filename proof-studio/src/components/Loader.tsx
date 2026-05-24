export default function Loader({ size = 24, color = "currentColor" }: { size?: number, color?: string }) {
  return (
    <svg 
      className="spinner" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="2.5" 
      strokeLinecap="round"
      style={{ display: 'inline-block' }}
    >
      <circle cx="12" cy="12" r="10" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75" />
    </svg>
  );
}
