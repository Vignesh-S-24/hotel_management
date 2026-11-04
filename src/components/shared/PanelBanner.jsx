// Blue hero strip naming a panel; the photo fades in from the right behind the text.
export default function PanelBanner({ icon: Icon, title, subtitle, image, className = '' }) {
  return (
    <div className={`relative flex h-28 items-center overflow-hidden rounded-xl bg-gradient-to-r from-[#1E3A8A] via-[#1E40AF] to-primary text-white shadow-card sm:h-32 ${className}`}>
      {image && (
        <img
          src={image}
          alt=""
          aria-hidden
          className="absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover [mask-image:linear-gradient(to_right,transparent,black_55%)] min-[480px]:block"
        />
      )}
      <div className="relative flex min-w-0 items-center gap-4 px-5 sm:gap-5 sm:px-7">
        <Icon className="h-10 w-10 shrink-0 sm:h-12 sm:w-12" strokeWidth={1.5} aria-hidden />
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold tracking-tight sm:text-xl">{title}</h2>
          <p className="mt-0.5 text-xs text-white/85 sm:text-sm">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}
