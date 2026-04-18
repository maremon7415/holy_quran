export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-border"></div>
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    </div>
  )
}
