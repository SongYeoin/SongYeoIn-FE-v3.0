import "./styles.css";

export const XSize48 = ({ size = "48", className }) => {
  const variantsClassName = "size-" + size;

  return (
    <svg
      className={"x-size-48 " + className + " " + variantsClassName}
      width="52"
      height="54"
      viewBox="0 0 52 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M39 13.5L13 40.5M13 13.5L39 40.5"
        stroke="#F5F5F5"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};