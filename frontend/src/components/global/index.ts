const modules = import.meta.glob('./*.vue', { eager: true })
const map: Record<string, any> = {}
Object.keys(modules).forEach((file) => {
  const modulesName = file.replace('./', '').replace('.vue', '')
  const module = modules[file] as { default: any }
  map[modulesName] = module.default
})
const globalComponents = {
  ...map
}
export default globalComponents