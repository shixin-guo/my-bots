// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { StreamLanguage } from '@codemirror/language';
import { go } from '@codemirror/legacy-modes/mode/go';
import CodeMirror from '@uiw/react-codemirror';
import { FC, useEffect, useState } from 'react';
interface Props {
  code: string;
  editable?: boolean;
  onClickTestCode?: () => void;
  onChange?: (value: string) => void;
  onClickCreateEmptyFile?: () => void;
}

export const CodeBlock: FC<Props> = ({
  code,
  editable = false,
  onClickCreateEmptyFile = null,
  onClickTestCode = null,
  onChange = () => {},
}) => {
  const [copyText, setCopyText] = useState<string>('Copy');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCopyText('Copy');
    }, 2000);

    return () => clearTimeout(timeout);
  }, [copyText]);

  return (
    <div className="relative">
      <button
        className="absolute right-1 top-1 z-10 rounded bg-slate-500 p-1 text-xs text-white hover:bg-slate-700 active:bg-slate-900"
        onClick={() => {
          navigator.clipboard.writeText(code);
          setCopyText('Copied!');
        }}
      >
        {copyText}
      </button>
      {onClickTestCode && (
        <button
          className="absolute right-12 top-1 z-10 rounded bg-slate-500 p-1 text-xs text-white hover:bg-slate-700 active:bg-slate-900"
          onClick={onClickTestCode}
        >
          Load Test Data
        </button>
      )}
      {onClickCreateEmptyFile && (
        <button
          className="absolute right-36 top-1 z-10 rounded bg-slate-500 p-1 text-xs text-white hover:bg-slate-700 active:bg-slate-900"
          onClick={onClickCreateEmptyFile}
        >
          Create
        </button>
      )}

      <CodeMirror
        editable={editable}
        value={code}
        minHeight="500px"
        className=" rounded-lg border-2 border-dotted border-slate-400"
        extensions={[StreamLanguage.define(go)]}
        theme={'light'}
        onChange={(value) => onChange(value)}
      />
    </div>
  );
};
