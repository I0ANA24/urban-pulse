interface HorizontalCardProps {
  title: string;
  placeholder: string;
}

export default function HorizontalCard({
  title, placeholder,
  ...props
}: HorizontalCardProps & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <>
      <div className="w-full px-5 py-4 bg-secondary rounded-2xl flex">
        <h5 className="font-bold text-sm">{title}</h5>

        <div className="w-px bg-white/90 mx-2"></div>

        <input
          type={title}
          placeholder={placeholder}
          className="text-sm outline-none"
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      </div>
    </>
  );
}
