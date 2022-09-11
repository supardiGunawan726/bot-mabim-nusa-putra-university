import {
  FC,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

type IMessage = {
  id: number;
  sender: "maba" | "mentor";
  content: string;
};

const isMentor = (sender: IMessage["sender"]) => sender === "mentor";

const botMentor: {
  receive: string[];
  response: string;
}[] = [
  {
    receive: ["hello", "hi", "hai", "helo"],
    response: "@received juga",
  },
  {
    receive: ["test"],
    response: "Test mulu",
  },
  {
    receive: ["p"],
    response: "Gak sopan! :(",
  },
];

export type IBiodataMaba = {
  name?: string;
  school?: string;
  group?: string;
  major?: string;
  whyPickMajor?: string;
};

const biodataMaba: IBiodataMaba = {};

type IQuestion = {
  question: string;
  response: string;
  onSuccess?: (payload: string) => void;
};

const questions: IQuestion[] = [
  {
    question: "Apa nama lengkap kamu?",
    response: "Salam kenal @payload!",
    onSuccess(payload) {
      biodataMaba.name = payload;
    },
  },
  {
    question: "Kamu asal sekolah mana?",
    response: "@payload terdengar keren!",
    onSuccess(payload) {
      biodataMaba.school = payload;
    },
  },
  {
    question: "Kamu masuk kelompok apa?",
    response: "That's cool",
    onSuccess(payload) {
      biodataMaba.group = payload;
    },
  },
  {
    question: "Ambil jurusan apa?",
    response: "@payload? pilihan yang tepat!",
    onSuccess(payload) {
      biodataMaba.major = payload;
    },
  },
  {
    question: "Kenapa kamu pilih jurusan itu?",
    response: "Menarik!",
    onSuccess(payload) {
      biodataMaba.whyPickMajor = payload;
    },
  },
  {
    question: "Udah selesai, ketik 'udah' untuk mengakhiri percakapan",
    response: "Good bye!",
  },
];

const useMessage = (options?: {
  onAddedMessage?: (message: IMessage) => void;
}) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [mentorTyping, setMentorTyping] = useState(false);

  const addMessage = (
    sender: IMessage["sender"],
    content: IMessage["content"]
  ) => {
    const id = Math.round(Date.now() * Math.random());
    const message: IMessage = {
      id,
      content,
      sender,
    };

    if (options?.onAddedMessage) options.onAddedMessage(message);

    if (sender === "maba") {
      setMessages((prev) => [...prev, message]);
      handleMentor(content);
    } else {
      setMentorTyping(true);
      setTimeout(() => {
        setMessages((prev) => [...prev, message]);
        setMentorTyping(false);
      }, 500);
    }
  };

  const handleMentor = (content: IMessage["content"]) => {
    const condition = botMentor.find((condition) =>
      condition.receive.find((msg) => msg === content)
    );

    if (!condition) {
      // addMessage("mentor", "aku gak paham maksud kamu :(");
      return;
    }

    const parseResponse = (response: typeof condition.response): string => {
      return response.replace("@received", content);
    };

    addMessage("mentor", parseResponse(condition.response));
  };

  return {
    messages,
    addMessage,
    mentorTyping,
  };
};

const ChatBox: FC<{
  onDone: (data: IBiodataMaba) => void;
}> = ({ onDone }) => {
  const [newMessage, setNewMessage] = useState("");
  const currentQuestionMsg = useRef<IQuestion["question"]>("");

  const chatContainerRef = useRef<HTMLElement>(null);
  const hasGreeting = useRef(false);

  const onAddedMessage = useCallback((message: IMessage) => {
    if (
      (message.content === "siap" || currentQuestionMsg.current) &&
      message.sender === "maba"
    ) {
      startAsking(message);
    }
  }, []);

  const { messages, addMessage, mentorTyping } = useMessage({
    onAddedMessage,
  });

  const startAsking = (newMessage: IMessage) => {
    const currentQuestion = questions.find(
      (question) => question.question === currentQuestionMsg.current
    );
    if (!currentQuestion) {
      const question = questions[0];
      addMessage("mentor", question.question);
      currentQuestionMsg.current = question.question;
    } else if (
      !botMentor.find((condition) =>
        condition.receive.find((msg) => msg === newMessage.content)
      )
    ) {
      addMessage(
        "mentor",
        currentQuestion.response.replace("@payload", newMessage.content)
      );
      if (currentQuestion.onSuccess)
        currentQuestion.onSuccess(newMessage.content);
      const newQuestionIndex = questions.indexOf(currentQuestion) + 1;

      if (newQuestionIndex > questions.length - 1) {
        if (newMessage.content === "udah") {
          setTimeout(() => onDone(biodataMaba), 200);
        }
        return;
      }

      const newQuestion = questions[newQuestionIndex];
      setTimeout(() => addMessage("mentor", newQuestion.question), 1000);
      currentQuestionMsg.current = newQuestion.question;
    } else {
      setTimeout(() => addMessage("mentor", currentQuestion.question), 500);
    }
  };

  useEffect(() => {
    if (hasGreeting.current) return;
    hasGreeting.current = true;

    const greetingMessages = [
      "Hallo Mahasiswa baru!",
      "Apakah kamu siap untuk memperkenalkan diri?",
      "Kalau udah bilang siap",
    ];

    greetingMessages.forEach((msg, index) => {
      setTimeout(() => {
        addMessage("mentor", msg);
      }, 1000 * index);
    });
  }, []);

  useLayoutEffect(() => {
    const chatContainer = chatContainerRef.current;

    const timeout = setTimeout(() => {
      if (!chatContainer) return;

      chatContainer.scrollTo({
        top: chatContainer.offsetHeight,
        behavior: "smooth",
      });
    }, 200);

    return () => {
      clearTimeout(timeout);
    };
  }, [messages]);

  return (
    <main className="max-w-[640px] mx-auto relative h-full sm:bg-gray-700 max-h-[80%] mt-16 sm:rounded-2xl sm:overflow-hidden">
      <header className="bg-gray-800 p-4 flex items-center">
        <figure className="w-12 h-12 bg-yellow-400 rounded-full overflow-hidden">
          <img
            src="https://avatars.dicebear.com/api/miniavs/mabim.svg"
            className="object-scale-down"
          />
        </figure>
        <div className="text-gray-100 ml-4">
          <h2 className="text-lg leading-none font-semibold">
            Bot Mabim NPU 2022
          </h2>
          <span className="text-sm leading-none">
            {mentorTyping ? "Mengetik..." : "Online"}
          </span>
        </div>
      </header>
      <section
        className="p-4 flex flex-col overflow-y-auto scrollbar-hidden absolute top-0 bottom-0 mt-[80px] mb-[60px] left-0 right-0"
        ref={chatContainerRef}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className="mt-2 first:mt-0 animate-swipeUp"
            style={{
              display: "flex",
              flexDirection: isMentor(message.sender) ? "row" : "row-reverse",
            }}
          >
            <span
              className={`bg-gray-800 text-gray-300 w-max block px-3 py-1.5 rounded-xl relative ${
                isMentor(message.sender) ? "rounded-bl-none" : "rounded-br-none"
              }`}
            >
              {message.content}
            </span>
          </div>
        ))}
      </section>
      <footer className="bg-gray-800 block p-3 absolute bottom-0 left-0 right-0">
        <form
          className="flex items-center justify-between"
          onSubmit={(e) => {
            if (mentorTyping) return;

            e.preventDefault();
            addMessage("maba", newMessage);
            setNewMessage("");
          }}
        >
          <input
            type="text"
            name="new_message"
            id="new_message"
            placeholder="Type your message"
            className="w-full py-1.5 px-2 bg-gray-700 rounded text-gray-200 focus:outline-none"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            autoComplete="off"
          />
          <button
            className="stroke-gray-200 hover:stroke-gray-400 p-1.5 transition-colors duration-200 ml-2"
            disabled={mentorTyping}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stroke-inherit"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </footer>
    </main>
  );
};

export default ChatBox;
