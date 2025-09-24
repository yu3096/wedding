export default function Backdrop({ visible, onClick, opaque = false }) {
  return (
    <div
      onClick={onClick}
      className={`fixed inset-0 z-[9998] transition-opacity duration-200
        ${visible ? "opacity-100" : "opacity-0"}
        ${opaque ? "bg-black" : "bg-black/40"}
        ${opaque ? "" : "backdrop-blur-md"}`}
    />
  );
}
