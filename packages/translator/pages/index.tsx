// import { getSession } from 'next-auth/react';
// import { GetStaticPropsContext } from "next";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Switch from '@radix-ui/react-switch';
import { CheckIcon } from '@radix-ui/react-icons';

import copyToClipboard from '@/utils/copyToClipboard';
import { todayDate } from '@/utils/date';
import { CodeBlock } from '@/components/CodeBlock';
import Layout from '@/components/Layout';
import {
  LanguageSelect,
  LanguageShortKey,
  languages,
} from '@/components/LanguageSelect';
import { Upload } from '@/components/Upload';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { TranslateBody } from '@/types/types';
import { getFileNameAndType } from '@/utils/fileUtils';
import * as ConvertUtils from '@/utils/convert';

const testCode = `
download_video = Download Video (MP4)
download_cc = Download CC Transcript (VTT)
user_add_conversations_to_the_playlist = {senderName} added {playListCount} conversation(s) to the playlist <span class="notification-link-name">{playlistName}</span>
auto_added_to_the_playlist = {playListCount} new conversation(s) auto-added to the playlist <span class="notification-link-name">{playlistName}</span>
notifications_will_appear_here = Notifications will appear here
over_time_tip = The percentage of conversations where {0} is mentioned over time.
mention_by_deal = Mentions by Deals Won or Lost
deal_tip = The percentage of conversations where {0} is mentioned by Deals Won or Lost.
transcript_title = {0} Mentions in {1}'s Conversations
chart_title = {0} Mentioned in {1}
chart_sub_title = The percentage of conversations hosted by {0} where this indicator is mentioned.
`;

interface handleTranslateProps {
  originLang: LanguageShortKey;
  exceptLang: LanguageShortKey;
  content: string;
}

const StartButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}> = ({ onClick, disabled, loading }) => {
  return (
    <button
      className="w-[160px] cursor-pointer rounded-md
              bg-blue-500 px-4 py-2 font-bold
                text-slate-50 hover:bg-blue-600 active:bg-blue-700"
      onClick={onClick}
      disabled={disabled}
    >
      {loading ? 'Translating...' : 'Start Translate'}
    </button>
  );
};

const DownloadButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  translatedLangs: LanguageShortKey[];
}> = ({ onClick, disabled, translatedLangs }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        {/* todo why react server render wrong when don't have asChild */}
        <TooltipTrigger asChild>
          <button
            className="float-right cursor-pointer rounded-md bg-emerald-500 px-2 py-2 text-slate-50 hover:bg-emerald-600 active:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            onClick={onClick}
            disabled={disabled}
          >
            Download Translated Files
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <span>
            {translatedLangs.length > 0 &&
              `[ ${translatedLangs.join(', ')} ] translated completed.`}
          </span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
export default function Home(): JSX.Element {
  const [inputLanguage, setInputLanguage] = useState<LanguageShortKey>('en-US');
  const [outputLanguage, setOutputLanguage] =
    useState<LanguageShortKey>('zh-CN');
  const [enableMultiLang, setEnableMultiLang] = useState<boolean>(false);
  const [selectedLangs, setSelectedLangs] = useState<LanguageShortKey[]>([
    inputLanguage,
    outputLanguage,
  ]);
  const [translatedLangs, setTranslatedLangs] = useState<LanguageShortKey[]>(
    [],
  );
  const [inputCode, setInputCode] = useState<string>('');
  const [outputCode, setOutputCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [finished, setFinished] = useState<boolean>(false);
  const [isMaskVisible, setMaskVisible] = useState(true);
  const [isMaskVisible2, setMaskVisible2] = useState(true);

  const toggleMask = useCallback((visible: boolean) => {
    setMaskVisible((prevVisible) => visible ?? !prevVisible);
  }, []);
  const toggleMask2 = useCallback((visible: boolean) => {
    setMaskVisible2((prevVisible) => visible ?? !prevVisible);
  }, []);

  const uploadRef = useRef({
    name: '',
    type: '',
  });

  const translatedContentRef = useRef<{
    [key: string]: string;
  }>({});

  const isSelectedAll = useMemo(() => {
    return selectedLangs.length === Object.keys(languages).length;
  }, [selectedLangs]);

  const multipleLanguagesWithStatus = useMemo(() => {
    return Object.values(languages).map((language) => {
      return {
        ...language,
        shortKey: language.shortKey as LanguageShortKey,
        checked:
          isSelectedAll ||
          ([inputLanguage, outputLanguage, ...selectedLangs].find(
            (l) => l === language.shortKey,
          )
            ? true
            : false),
        disabled:
          isSelectedAll ||
          language.shortKey === inputLanguage ||
          language.shortKey === outputLanguage,
      };
    });
  }, [outputLanguage, inputLanguage, selectedLangs, isSelectedAll]);

  const handleTranslate = async ({
    originLang,
    exceptLang,
    content,
  }: handleTranslateProps): Promise<void> => {
    if (originLang === exceptLang) {
      alert('Please select different languages.');
      return;
    }
    if (!content) {
      alert('Please enter some code.');
      return;
    }

    setOutputCode('');

    const controller = new AbortController();

    const body: TranslateBody = {
      inputLanguage: originLang,
      outputLanguage: exceptLang,
      inputCode: content,
    };

    const response = await fetch('/api/tsProperties', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // setLoading(false);
      alert('Something went wrong.');
      return;
    }

    const data = response.body;

    if (!data) {
      // setLoading(false);
      alert('Something went wrong.');
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      if (exceptLang === outputLanguage) {
        setOutputCode((prevCode) => prevCode + chunkValue);
      }
      if (!translatedContentRef.current[exceptLang]) {
        translatedContentRef.current[exceptLang] = chunkValue;
      } else {
        translatedContentRef.current[exceptLang] += chunkValue;
      }
    }
    setTranslatedLangs((prevLangs) => [...prevLangs, exceptLang]);
  };
  const convertCode2Properties = (
    code: string,
    type: ConvertUtils.FileType,
  ): string => {
    let properties = '';
    switch (type) {
      case ConvertUtils.FileType.YAML:
      case ConvertUtils.FileType.YML:
        properties = ConvertUtils.yaml2Properties(code);
        break;
      case ConvertUtils.FileType.JSON:
        properties = ConvertUtils.json2Properties(JSON.parse(code));
        break;
      // case 'md' |"mdx":
      // todo

      default:
        properties = code;
    }
    return properties;
  };
  const convertProperties2Code = (
    properties: string,
    type: ConvertUtils.FileType,
  ): string => {
    let code = '';
    switch (type) {
      case ConvertUtils.FileType.YAML:
      case ConvertUtils.FileType.YML:
        code = ConvertUtils.properties2YAML(properties);
        break;
      case ConvertUtils.FileType.JSON:
        // todo
        code = JSON.stringify(
          ConvertUtils.properties2Json(properties),
          null,
          2,
        );
        break;
      // case 'md' |"mdx":
      // todo

      default:
        code = properties;
    }
    return code;
  };

  const handleTranslateMultiLanguages = async (
    selectedLangs: LanguageShortKey[],
  ): Promise<void> => {
    translatedContentRef.current = {};
    setLoading(true);
    setTranslatedLangs([]);

    Promise.all(
      selectedLangs
        .filter((l) => l !== inputLanguage)
        .map(async (selectedLang) => {
          if (
            !Object.values(ConvertUtils.FileType).includes(
              uploadRef.current.type as ConvertUtils.FileType,
            )
          ) {
            alert('Please upload a valid file.');
            return;
          }
          await handleTranslate({
            originLang: inputLanguage,
            exceptLang: selectedLang,
            content: convertCode2Properties(
              inputCode,
              uploadRef.current.type as ConvertUtils.FileType,
            ),
          });
        }),
    )
      .then(() => {
        copyToClipboard(outputCode);
      })
      .catch((err) => {
        alert(err);
      })
      .finally(() => {
        setFinished(true);
        setLoading(false);
      });
  };

  const handleDownloadZip = async (): Promise<void> => {
    const zip = new JSZip();
    Object.keys(translatedContentRef.current).map((shortKey) => {
      if (translatedContentRef.current[shortKey]) {
        const fileNamePrefix = uploadRef.current.name || 'i18n';
        const filename = `${fileNamePrefix}_${shortKey}.properties`;
        zip.file(filename, translatedContentRef.current[shortKey]);
      }
    });
    zip.generateAsync({ type: 'blob' }).then(function (blob) {
      saveAs(blob, `i18n-${todayDate()}.zip`);
    });
  };
  const handleInputLanguageChange = useCallback(
    (lang: LanguageShortKey) => {
      setInputLanguage(lang);
      setSelectedLangs((prev) => {
        if (isSelectedAll) {
          return prev;
        }
        return prev.filter((key) => {
          return key !== inputLanguage;
        });
      });
      setInputCode('');
      setOutputCode('');
    },
    [inputLanguage, isSelectedAll],
  );

  const handleOutputLanguageChange = useCallback(
    (lang: LanguageShortKey) => {
      setOutputLanguage(lang);
      setSelectedLangs((prev) => {
        if (isSelectedAll) {
          return prev;
        }
        return [
          ...prev.filter((key) => {
            return key !== outputLanguage;
          }),
          lang,
        ];
      });
      setOutputCode(translatedContentRef.current[lang]);
    },
    [outputLanguage, isSelectedAll],
  );

  const handleUploadedFile = async (files: File[]) => {
    const input = await files[0].text();
    setInputCode(input);
    uploadRef.current = getFileNameAndType(files[0].name);
    toggleMask(false);
  };

  useEffect(() => {
    if (finished) {
      Object.keys(translatedContentRef.current).map((shortKey) => {
        if (translatedContentRef.current[shortKey]) {
          translatedContentRef.current[shortKey] = convertProperties2Code(
            translatedContentRef.current[shortKey],
            uploadRef.current.type as ConvertUtils.FileType,
          );
        }
      });
      setOutputCode(translatedContentRef.current[outputLanguage]);
      toggleMask2(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, toggleMask2]);
  return (
    <>
      <div className="flex h-full min-h-screen flex-col items-center border-t border-gray-200 bg-[url('https://tailwindui.com/img/beams-home@95.jpg')] px-4 pb-20 font-sans sm:px-10">
        <div className="mb-4 flex w-full flex-col justify-between sm:flex-row sm:space-x-4">
          <div className="flex h-full flex-col justify-center space-y-2 sm:w-2/4">
            <div className="flex h-16 items-center text-[20px] text-base font-bold leading-7">
              Original
            </div>

            <LanguageSelect
              language={inputLanguage}
              disabled={loading}
              onChange={handleInputLanguageChange}
            />
            <div className="relative">
              {isMaskVisible && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-200 bg-opacity-50">
                  <Upload
                    className="w-100 rounded-lg pb-5 pt-6"
                    onSuccess={handleUploadedFile}
                  />
                </div>
              )}
              <CodeBlock
                code={inputCode}
                editable={!loading}
                onChange={(value) => {
                  setInputCode(value);
                }}
                onClickTestCode={() => setInputCode(testCode)}
                onClickCreateEmptyFile={() => {
                  setInputCode('');
                  toggleMask(false);
                }}
              />
            </div>
          </div>
          <div className="mt-8 flex h-full flex-col justify-center space-y-2 sm:mt-0 sm:w-2/4">
            <div className="flex h-16 items-center justify-between">
              <span className="text-[20px] text-base font-bold leading-7">
                Translation
              </span>
              {finished && (
                <DownloadButton
                  onClick={handleDownloadZip}
                  disabled={loading || outputCode?.length === 0}
                  translatedLangs={translatedLangs}
                />
              )}
            </div>

            {/* <p className="mt-1 text-slate-400">* download as an zip file and files named look like: demo_en-US.properties</p> */}
            <LanguageSelect
              language={outputLanguage}
              disabled={loading}
              onChange={handleOutputLanguageChange}
            />

            <div className="relative">
              {isMaskVisible2 && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-200 bg-opacity-50">
                  <div className="mt-2 flex items-center space-x-2 ">
                    {
                      <StartButton
                        onClick={() =>
                          handleTranslateMultiLanguages(selectedLangs)
                        }
                        loading={loading}
                      />
                    }
                  </div>
                  <>
                    <div
                      className="mb-2 mt-2 flex items-center"
                      style={{ display: 'flex', alignItems: 'center' }}
                    >
                      <label
                        className="text-[15px] leading-none"
                        htmlFor="airplane-mode"
                      >
                        Translate to multiple languages:
                      </label>
                      <Switch.Root
                        className="relative ml-2 h-[25px] w-[42px] cursor-default rounded-full bg-slate-200 shadow-[0_2px_10px] outline-none data-[state=checked]:bg-blue-500"
                        checked={enableMultiLang}
                        onCheckedChange={(checked: boolean) => {
                          setEnableMultiLang(checked);
                        }}
                      >
                        <Switch.Thumb className="block h-[21px] w-[21px] translate-x-0.5 rounded-full bg-white transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[19px]" />
                      </Switch.Root>
                    </div>
                    {enableMultiLang && (
                      <>
                        <div className="mb-5 flex flex-wrap items-center justify-center">
                          {Object.values(multipleLanguagesWithStatus).map(
                            (language) => {
                              return (
                                <div
                                  className="justify-space-evenly mt-2 flex h-6 items-center"
                                  key={language.shortKey}
                                >
                                  <Checkbox.Root
                                    key={language.shortKey}
                                    className="shadow-blackA7 hover:bg-violet3 flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-[6px] border-[1px] border-slate-400 bg-white outline-none data-[disabled]:cursor-not-allowed data-[disabled]:bg-[#9CA3AF]"
                                    id="c1"
                                    checked={language.checked}
                                    disabled={language.disabled}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedLangs((prev) => {
                                          return [...prev, language.shortKey];
                                        });
                                      } else {
                                        setSelectedLangs((prev) =>
                                          prev.filter(
                                            (key) => key !== language.shortKey,
                                          ),
                                        );
                                      }
                                    }}
                                  >
                                    <Checkbox.Indicator className="text-[black]">
                                      <CheckIcon />
                                    </Checkbox.Indicator>
                                  </Checkbox.Root>
                                  <label
                                    className="w-48 pl-[8px] text-[16px] leading-none"
                                    htmlFor="c1"
                                  >
                                    {language.name}
                                    <span className="text-sm ">
                                      {' '}
                                      ({language.shortKey})
                                    </span>
                                  </label>
                                </div>
                              );
                            },
                          )}
                        </div>
                        <div className="flex flex-wrap items-center justify-start">
                          <Checkbox.Root
                            className="shadow-blackA7 hover:bg-violet3 flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-[6px] border-[1px] border-slate-400 bg-white outline-none"
                            defaultChecked={isSelectedAll}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedLangs(
                                  Object.keys(languages) as LanguageShortKey[],
                                );
                              } else {
                                setSelectedLangs([
                                  inputLanguage,
                                  outputLanguage,
                                ]);
                              }
                            }}
                          >
                            <Checkbox.Indicator className="text-[black]">
                              <CheckIcon />
                            </Checkbox.Indicator>
                          </Checkbox.Root>
                          <label
                            className="pl-[8px] text-[16px] leading-none "
                            htmlFor="c1"
                          >
                            Select All
                          </label>
                        </div>
                      </>
                    )}
                  </>
                </div>
              )}
              <CodeBlock code={outputCode} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

Home.Layout = Layout;
