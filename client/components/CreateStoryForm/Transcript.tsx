import { useState } from "react";

const Transcript = (opts: {
  sectionIndex: number;
  updateSection: (sectionIndex: number, updated: any) => void;
}) => {
  const { sectionIndex, updateSection } = opts;
  const [transcriptData, setTranscriptData] = useState<any[]>([
    { type: "Text" },
  ]);

  const addTranscript = () => {
    const currentTranscriptData = [...transcriptData];
    currentTranscriptData.push({ type: "Text" });
    setTranscriptData(currentTranscriptData);
  };

  const removeTranscript = (index: number) => {
    const currentTranscriptData = [...transcriptData];
    currentTranscriptData.splice(index, 1);
    setTranscriptData(currentTranscriptData);
  };

  const updateType = (index: number, value: string) => {
    const currentTranscriptData = [...transcriptData];
    if (
      typeof currentTranscriptData[index] === "string" &&
      value === "Condition"
    ) {
      currentTranscriptData[index] = { type: value };
    } else {
      currentTranscriptData[index].type = value;
    }
    if (value === "Condition") {
      currentTranscriptData[index].rule = "equals";
    }
    setTranscriptData(currentTranscriptData);
    updateSection(sectionIndex, { p: currentTranscriptData });
  };

  const updateConditional = (
    index: number,
    updated: { [key: string]: string }
  ) => {
    const currentTranscriptData = [...transcriptData];
    currentTranscriptData[index] = {
      ...currentTranscriptData[index],
      ...updated,
    };
    setTranscriptData(currentTranscriptData);
    updateSection(sectionIndex, { p: currentTranscriptData });
  };

  const updateText = (index: number, text: string) => {
    const currentTranscriptData = [...transcriptData];
    currentTranscriptData[index] = text;
    setTranscriptData(currentTranscriptData);
    updateSection(sectionIndex, { p: currentTranscriptData });
  };

  const transcriptFormInput = (index: number, transcriptInput: any) => {
    const renderConditional = () => {
      return (
        <div className="flex flex-col">
          <div className="flex mb-2">
            <input
              placeholder="variableName"
              className="w-full h-10 px-2 mr-2 font-semibold text-gray-700 bg-gray-100 border rounded outline-none focus:outline-none text-md hover:text-black focus:text-black md:text-basecursor-default focus:border-gray-400 focus:border focus:bg-gray-100"
              value={transcriptData[index].var ? transcriptData[index].var : ""}
              onChange={(e) => {
                const value = e.target.value;
                updateConditional(index, { var: value });
              }}
            ></input>
            <div className="relative inline-block w-64">
              <select
                className="block w-full px-4 py-2 pr-8 leading-tight bg-white border border-gray-400 rounded shadow appearance-none hover:border-gray-500 focus:outline-none focus:shadow-outline"
                onChange={(e) => {
                  const value = e.target.value;
                  updateConditional(index, { rule: value });
                }}
              >
                <option>Equals</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 pointer-events-none">
                <svg
                  className="w-4 h-4 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <div className="flex mb-2">
              <p className="px-2 w-18">"True"</p>
              <input
                placeholder="This is what is written when it is true"
                className="w-full h-10 px-2 font-semibold text-gray-700 bg-gray-100 border rounded outline-none focus:outline-none text-md hover:text-black focus:text-black md:text-basecursor-default focus:border-gray-400 focus:border focus:bg-gray-100"
                value={
                  transcriptData[index].true ? transcriptData[index].true : ""
                }
                onChange={(e) => {
                  const value = e.target.value;
                  updateConditional(index, { true: value });
                }}
              ></input>
            </div>
            <div className="flex">
              <p className="px-2 2-18">"False"</p>
              <input
                placeholder="This is what is written when it is false"
                className="w-full h-10 px-2 font-semibold text-gray-700 bg-gray-100 border rounded outline-none focus:outline-none text-md hover:text-black focus:text-black md:text-basecursor-default focus:border-gray-400 focus:border focus:bg-gray-100"
                value={
                  transcriptData[index].false ? transcriptData[index].false : ""
                }
                onChange={(e) => {
                  const value = e.target.value;
                  updateConditional(index, { false: value });
                }}
              ></input>
            </div>
          </div>
        </div>
      );
    };

    const renderText = () => {
      return (
        <textarea
          rows={3}
          className="form-control block w-full px-3 py-1.5 text-md bg-gray-100 hover:text-black focus:text-black md:text-basecursor-default focus:border-gray-400 focus:border focus:bg-gray-100 font-normal text-gray-700 bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:outline-none"
          value={
            transcriptData[index] && typeof transcriptData[index] === "string"
              ? transcriptData[index]
              : ""
          }
          onChange={(e) => {
            const text = e.target.value;
            updateText(index, text);
          }}
        ></textarea>
      );
    };

    return (
      <div key={index} className="">
        <div className="flex flex-col p-2 mb-2 border">
          <div className="flex items-center mb-2">
            <p className="mr-2">Type:</p>
            <div className="relative inline-block w-64">
              <select
                className="block w-full px-4 py-2 pr-8 leading-tight bg-white border border-gray-400 rounded shadow appearance-none hover:border-gray-500 focus:outline-none focus:shadow-outline"
                onChange={(e) => {
                  const chosen =
                    e.target.value === "Text" ? "Text" : "Condition";
                  updateType(index, chosen);
                }}
              >
                <option>Text</option>
                <option>Condition</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 pointer-events-none">
                <svg
                  className="w-4 h-4 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
          {transcriptInput.type === "Condition"
            ? renderConditional()
            : renderText()}
        </div>
        <div className="flex flex-col">
          {transcriptData.length === index + 1 && (
            <button
              className="flex items-center justify-center w-10 p-2 mb-2 text-white bg-green-500"
              onClick={() => {
                addTranscript();
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          )}
          {transcriptData.length === index + 1 && index + 1 > 1 && (
            <button
              className="flex items-center justify-center w-10 p-2 text-white bg-red-500"
              onClick={() => {
                removeTranscript(index);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-2">
      <label className="font-medium text-gray-900">Chapter Transcripts</label>
      <div className="flex flex-col">
        {transcriptData.map((transcriptInput, index) =>
          transcriptFormInput(index, transcriptInput)
        )}
      </div>
    </div>
  );
};

export default Transcript;
