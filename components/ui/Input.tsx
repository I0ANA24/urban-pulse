interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function Input({ type, placeholder, className, ...props }: InputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className={`w-full bg-input border border-white/50 text-white placeholder:text-white/60 px-5 py-3 rounded-full outline-none focus:border-white transition-colors ${className}`}
      {...props}
    />
  );
}