// Monta o caminho de um arquivo de public/ respeitando o "base" do Vite,
// para o site funcionar tanto em usuario.github.io quanto em usuario.github.io/repo.
export function asset(path) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}
