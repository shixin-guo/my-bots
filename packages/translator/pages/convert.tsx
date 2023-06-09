import { default as NextImage } from "next/image";
import { useMemo, useState } from "react";

import copyToClipboard from "@/utils/copyToClipboard";
import { CodeBlock } from "@/components/CodeBlock";
import Layout from "@/components/Layout";

enum FileType {
  JSON = "Json",
  PROPERTIES = "Properties",
}
export function jsonToProperties(json: any): string {
  let result = "";
  for (const key in json) {
    if (typeof json[key] === "object") {
      const subKeys = jsonToProperties(json[key]).split("\n");
      subKeys.forEach(subKey => {
        if (subKey.trim()) {
          result += key + "." + subKey + "\n";
        }
      });
    } else {
      result += key + "=" + json[key] + "\n";
    }
  }
  return result;
}

export function propertiesToJson(properties: string): any {
  const result: any = {};
  const lines = properties.split("\n");
  lines.forEach(line => {
    const parts = line.split("=");
    const keys = parts?.[0]?.split(".").map(key => key?.trim());
    const value = parts?.[1]?.trim();
    if (!keys || !keys.length || !value) {
      console.log("Invalid line: " + line);
      return;
    }
    let obj = result;
    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        try {
          obj[key] = value;
        } catch (e) {
          console.log("line", line, "Error", e);
        }
      } else {
        if (!obj[key]) {
          obj[key] = {};
        }
        obj = obj[key];
      }
    });
  });
  return result;
}

export default function Json(): JSX.Element {
  const [inputCode, setInputCode] = useState<string>("");
  const [outputCode, setOutputCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [inputType, setInputType] = useState<FileType>(FileType.JSON);
  const outputType = useMemo(() => {
    return inputType === FileType.JSON ? FileType.PROPERTIES : FileType.JSON;
  }, [inputType]);
  const reverseInputAndOutput = ():void => {
    setInputType(inputType === FileType.JSON ? FileType.PROPERTIES : FileType.JSON);
  };
  const convertHandler = async(): Promise<void> => {
    if (!inputCode) {
      alert("Please enter some code.");
      return;
    }
    setLoading(true);
    const outPutCode = inputType === FileType.JSON
      ? jsonToProperties(JSON.parse(inputCode))
      : JSON.stringify(propertiesToJson(inputCode), null, 2);
    setOutputCode(outPutCode);
    copyToClipboard(outputCode);
    setLoading(false);
  };

  return (
    <>
      <div className="flex h-full min-h-screen flex-col items-center
      bg-[url('https://tailwindui.com/img/beams-home@95.jpg')]
       px-4 pb-20 sm:px-10 font-sans">
        <div className="mt-2 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold"> {`${inputType} --> ${outputType}`}</div>
        </div>

        <div className="mt-4 flex items-center space-x-2">

          <button
            className="w-[160px] cursor-pointer rounded-md
             bg-blue-500 px-4 py-2 font-bold
              hover:bg-blue-600 active:bg-blue-700 text-slate-50"
            onClick={() => convertHandler()}
            disabled={loading}
          >
            {"Start Convert"}
          </button>
        </div>
        <div className="mt-4 -mb-8 flex items-center space-x-2 z-50">
          <button
            className="cursor-pointer rounded-md
              px-4 font-bold
               text-slate-50"
            onClick={reverseInputAndOutput}
          >
            <NextImage
              className="rounded-lg"
              width={30}
              height={30}
              src={"/convert.svg"}
              alt={"Product Image"}
            />
          </button>
        </div>

        <div className="flex w-full mb-4 max-w-[1200px] flex-col justify-between sm:flex-row sm:space-x-4">
          <div className="h-full flex flex-col justify-center space-y-2 sm:w-2/4">
            <div className="text-center text-xl font-bold">{inputType}</div>
            <CodeBlock
              code={inputCode}
              editable={!loading}
              onChange={(value) => {
                setInputCode(value);
              }}
            />
          </div>
          <div className="mt-8 flex h-full flex-col justify-center space-y-2 sm:mt-0 sm:w-2/4">
            <div className="text-center text-xl font-bold">{outputType}</div>
            <CodeBlock code={outputCode} />
          </div>
        </div>
      </div>
    </>
  );
}

Json.Layout = Layout;
