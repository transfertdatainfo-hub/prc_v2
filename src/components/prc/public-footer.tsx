export function PublicFooter() {
  return (
    <footer className="w-full border-t border-prc-primary/10 bg-prc-background">
      <div className="mx-auto max-w-5xl px-4 py-4 text-xs text-prc-text/60">
        © {new Date().getFullYear()} PRC. Tous droits réservés.
      </div>
    </footer>
  );
}
