import type { SVGProps } from "react";

export default function Credit(props: SVGProps<SVGSVGElement>) {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
            <path d="M2 11V13H18V11H2ZM2 0H18C18.55 0 19.0208 0.195833 19.4125 0.5875C19.8042 0.979167 20 1.45 20 2V13C20 13.55 19.8042 14.0208 19.4125 14.4125C19.0208 14.8042 18.55 15 18 15H14V20L10 18L6 20V15H2C1.45 15 0.979167 14.8042 0.5875 14.4125C0.195833 14.0208 0 13.55 0 13V2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0ZM2 8H18V2H2V8ZM2 13V2V13Z" fill="#C7AF6D" />
        </svg>
    );
}