interface Badge {
  id: number
  name: string
}
export default function useBadge() {

  function changeRecordStatus(item: boolean) {
    if (item) return { name: 'Activo', className: 'eit-badge__outline--secondary', status: item }
    if (!item) return { name: 'Inactivo', className: 'eit-badge__outline--gray', status: item }
    return { name: 'Sin estado', className: 'eit-badge__outline--gray', status: false }
  }
  function changeBadgeGray(item: Badge | null) {
    if(item) return { id: item.id, name: item.name, className: 'eit-badge__outline--gray' }
    else return { id: 0, name: 'Sin datos', className: 'eit-badge__outline--gray' }
  }
  function changeFavorite(item: boolean) {
    if (item) return { name: '', className: 'eit-font__size--x4 eit-color--yellow', icon: 'fa-solid fa-star', status: item }
    if (!item) return { name: '', className: 'eit-font__size--x4 eit-color--text-soft', icon: 'fa-regular fa-star', status: item }
    return { name: '', className: 'eit-font__size--x4 eit-color--text-soft', status: false }
  }
  function changeEstadoSesion(estado: string) {
    const badges: Record<string, { name: string; className: string; estadoRaw: string }> = {
      'pendiente': { name: 'Pendiente', className: 'eit-badge eit-badge__outline--warning', estadoRaw: estado },
      'en_progreso': { name: 'En Progreso', className: 'eit-badge eit-badge__outline--info', estadoRaw: estado },
      'completado': { name: 'Completado', className: 'eit-badge eit-badge__outline--success', estadoRaw: estado },
      'expirado': { name: 'Expirado', className: 'eit-badge eit-badge__outline--danger', estadoRaw: estado },
      'cancelado': { name: 'Cancelado', className: 'eit-badge eit-badge__outline--secondary', estadoRaw: estado }
    }
    return badges[estado] || { name: estado, className: 'eit-badge eit-badge__outline--gray', estadoRaw: estado }
  }
  return {
    changeRecordStatus,
    changeBadgeGray,
    changeFavorite,
    changeEstadoSesion
  }
}
