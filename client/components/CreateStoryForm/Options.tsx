import { useState } from "react";

const Options = (opts: {
  sectionIndex: number;
  updateSection: (sectionIndex: number, updated: any) => void;
}) => {
  const { sectionIndex, updateSection } = opts;
  const [optionData, setOptionData] = useState<any[]>([["", ""]]);

  const handleKeyValueUpdate = (index: number, value: string) => {
    const currentOptions = [...optionData];
    currentOptions[index][0] = value;
    setOptionData(currentOptions);
    const optionsObject: { [key: string]: string } = {};
    currentOptions.map((option: [string, string]) => {
      optionsObject[option[0]] = option[1];
    });
    updateSection(sectionIndex, { options: optionsObject });
  };

  const handleValueUpdate = (index: number, value: string) => {
    const currentOptions = [...optionData];
    currentOptions[index][1] = value;
    setOptionData(currentOptions);
    const optionsObject: { [key: string]: string } = {};
    currentOptions.map((option: [string, string]) => {
      optionsObject[option[0]] = option[1];
    });
    updateSection(sectionIndex, { options: optionsObject });
  };

  const removeOption = (index: number) => {
    const currentOptions = [...optionData];
    currentOptions.splice(index, 1);
    setOptionData(currentOptions);
  };

  const addOption = () => {
    const currentOptions = [...optionData];
    currentOptions.push(["", ""]);
    setOptionData(currentOptions);
  };

  const actionBlock = (
    index: number,
    optionKey: string,
    optionValue: string
  ) => {
    return (
      <div key={index}>
        <div className="flex mb-2">
          <input
            placeholder="Choice"
            className="w-full h-10 px-2 mr-2 font-semibold text-gray-700 bg-gray-100 border rounded outline-none focus:outline-none text-md hover:text-black focus:text-black md:text-basecursor-default focus:border-gray-400 focus:border focus:bg-gray-100"
            value={optionKey}
            onChange={(e) => {
              handleKeyValueUpdate(index, e.target.value);
            }}
          ></input>
          <input
            placeholder="Section Tile"
            className="w-full h-10 px-2 font-semibold text-gray-700 bg-gray-100 border rounded outline-none focus:outline-none text-md hover:text-black focus:text-black md:text-basecursor-default focus:border-gray-400 focus:border focus:bg-gray-100"
            value={optionValue}
            onChange={(e) => {
              handleValueUpdate(index, e.target.value);
            }}
          ></input>
        </div>
        {optionData.length === index + 1 && index + 1 > 1 && (
          <button
            className="flex items-center justify-center p-2 mb-2 text-white bg-red-500"
            onClick={() => {
              removeOption(index);
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
        {optionData.length === index + 1 && (
          <button
            className="flex items-center justify-center p-2 my-2 text-white bg-green-500"
            onClick={() => {
              addOption();
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
      </div>
    );
  };

  return (
    <div className="pt-4 space-y-2">
      <p className="font-medium text-gray-900">Options</p>
      <div className="flex flex-col">
        {optionData.map((action, index) =>
          actionBlock(index, action[0], action[1])
        )}
      </div>
    </div>
  );
};

export default Options;
