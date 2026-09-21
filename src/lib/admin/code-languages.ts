/** 코드박스 기술 스택 / 언어 선택 옵션 */
export const CODE_LANGUAGES = [
  { id: "", label: "언어 없음" },
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "tsx", label: "TSX" },
  { id: "jsx", label: "JSX" },
  { id: "java", label: "Java" },
  { id: "python", label: "Python" },
  { id: "go", label: "Go" },
  { id: "rust", label: "Rust" },
  { id: "csharp", label: "C#" },
  { id: "cpp", label: "C++" },
  { id: "c", label: "C" },
  { id: "kotlin", label: "Kotlin" },
  { id: "swift", label: "Swift" },
  { id: "php", label: "PHP" },
  { id: "ruby", label: "Ruby" },
  { id: "sql", label: "SQL" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "scss", label: "SCSS" },
  { id: "json", label: "JSON" },
  { id: "yaml", label: "YAML" },
  { id: "bash", label: "Bash" },
  { id: "shell", label: "Shell" },
  { id: "vue", label: "Vue" },
  { id: "markdown", label: "Markdown" },
  { id: "graphql", label: "GraphQL" },
  { id: "dockerfile", label: "Dockerfile" },
  { id: "plaintext", label: "Plain text" },
] as const;

export type CodeLanguageId = (typeof CODE_LANGUAGES)[number]["id"];

export function codeLanguageLabel(id: string | null | undefined): string {
  if (!id) return "";
  const found = CODE_LANGUAGES.find((l) => l.id === id);
  return found?.label ?? id;
}
