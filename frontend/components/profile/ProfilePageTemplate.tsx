interface ProfilePageTemplateProps {
  children: React.ReactNode;
  title: string;
}

export default function ProfilePageTemplate({
  children,
  title,
}: ProfilePageTemplateProps) {
  return (
    <div className="w-full flex flex-col justify-baseline items-center mt-4 animate-fade-up">
      <h1 className="font-montagu text-2xl font-bold mb-6">{title}</h1>
      {children}
    </div>
  );
}
