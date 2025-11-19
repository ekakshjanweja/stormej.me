export default function Footer() {
  return (
    <footer className="mt-12 border-t border-border/40 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="py-8">
        <div className="flex flex-col items-center gap-6">
          {/* Copyright and Location */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} - new delhi
            </p>
            <p className="text-sm font-medium text-foreground">stormej</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
