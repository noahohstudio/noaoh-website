// A fresh copy of the case study on every visit, so its entrance (globals.css,
// "Entrances") plays going from one case study straight to the next, too.
export default function WorkTemplate({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
