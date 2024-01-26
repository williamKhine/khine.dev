export default function FormLabel({ children, ...props }) {
  return (
    <label {...props}>
      {children}
    </label>
  );
}
