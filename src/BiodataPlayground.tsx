import { DOMAttributes, FC, useEffect, useRef } from "react";
import { IBiodataMaba } from "./ChatBox";

const BiodataPlayground: FC<{
  biodataMaba: IBiodataMaba;
}> = ({ biodataMaba }) => {
  const playgroundRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.body.style.backgroundImage = "none";
  }, []);

  const handleClick: DOMAttributes<HTMLElement>["onClick"] = (e) => {
    const playground = playgroundRef.current;
    if (!playground) return;

    const biodata: string[] = [
      ...Object.values({ ...biodataMaba, whyPickMajor: "" }),
      ...(biodataMaba.whyPickMajor || "").split(" "),
    ].filter(Boolean);
    const data = biodata[Math.floor(Math.random() * biodata.length)];
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    playground.style.backgroundColor = randomColor;

    const circleWrapper = document.createElement("div");
    circleWrapper.style.position = "absolute";
    circleWrapper.style.top = "0";
    circleWrapper.style.left = "0";
    circleWrapper.style.bottom = "0";
    circleWrapper.style.right = "0";
    circleWrapper.style.transformOrigin = `${e.clientX}px ${e.clientY}px`;
    circleWrapper.className = "animate-zoom";

    const circle = document.createElement("div");
    const randomWidth = Math.max(
      Math.max(window.innerWidth / 10, 100),
      Math.floor(Math.random() * (window.innerWidth / 2))
    );
    circle.style.backgroundColor = randomColor;
    circle.className =
      "absolute animate-fadeInOut rounded-full overflow-hidden grid place-items-center transform -translate-x-1/2 -translate-y-1/2";
    circle.style.width = `${randomWidth}px`;
    circle.style.height = `${randomWidth}px`;
    circle.style.fontSize = `${randomWidth}px`;
    circle.style.top = `${e.clientY}px`;
    circle.style.left = `${e.clientX}px`;

    const content = document.createElement("span");
    content.textContent = data;
    content.style.fontSize = "0.125em";
    content.style.textAlign = "center";
    content.style.userSelect = "none";

    circle.appendChild(content);
    circleWrapper.appendChild(circle);
    playground.appendChild(circleWrapper);

    setTimeout(() => {
      playground.removeChild(circleWrapper);
    }, 2000);
  };

  return (
    <main
      className="animate-fade absolute top-0 bottom-0 left-0 right-0 z-10 transition-colors ease-in-out duration-1000 delay-500 cursor-pointer"
      ref={playgroundRef}
      onClick={handleClick}
      style={{ backgroundColor: "white" }}
    ></main>
  );
};

export default BiodataPlayground;
