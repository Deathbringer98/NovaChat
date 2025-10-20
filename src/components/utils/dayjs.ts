
export default function dayjs(ts: number){
  return {
    format(fmt: string){
      const d = new Date(ts)
      const HH = String(d.getHours()).padStart(2,'0')
      const mm = String(d.getMinutes()).padStart(2,'0')
      const dd = String(d.getDate()).padStart(2,'0')
      const MM = String(d.getMonth()+1).padStart(2,'0')
      const yyyy = d.getFullYear()
      return fmt.replace('HH', HH).replace('mm', mm).replace('DD', dd).replace('MM', MM).replace('YYYY', String(yyyy))
    }
  }
}
