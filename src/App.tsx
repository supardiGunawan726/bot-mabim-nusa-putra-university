import { useState } from "react";
import BiodataPlayground from "./BiodataPlayground";
import ChatBox, { IBiodataMaba } from "./ChatBox";

export default function App() {
  const [biodataMaba, setBiodataMaba] = useState<IBiodataMaba>();
  return (
    <>
      {biodataMaba && <BiodataPlayground biodataMaba={biodataMaba} />}
      <ChatBox onDone={setBiodataMaba} />
    </>
  );
}
