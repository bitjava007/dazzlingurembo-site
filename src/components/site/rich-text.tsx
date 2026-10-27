/**
 * Texte saisi dans l'administration : paragraphes séparés par une ligne vide,
 * lignes commençant par « ## » rendues comme intertitres. Aucun HTML n'est interprété.
 */
export function RichText({ text, lang, className = "" }: { text: string; lang?: string; className?: string }) {
  const blocks = text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
  return (
    <div lang={lang} className={`flex max-w-2xl flex-col gap-5 text-lg font-light leading-relaxed text-umber ${className}`}>
      {blocks.map((block, i) =>
        block.startsWith("## ") ? (
          <h2 key={i} className="display mt-6 text-3xl text-ink">
            {block.slice(3)}
          </h2>
        ) : (
          <p key={i} className="whitespace-pre-line">
            {block}
          </p>
        ),
      )}
    </div>
  );
}
