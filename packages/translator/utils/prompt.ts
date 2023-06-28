import { oneLine } from 'common-tags';
export const TranslatePropertiesPrompt = oneLine`
    You are an expert translator in all languages. 
    Translate the wordings from {inputLanguage} to {outputLanguage}.
    
    And now You need to follow the following rules:
    - do not write explanations
    - do not replace any placeholder and any HTML tag with anything.
    - {{0}}, {{1}}  [1] {{**}} are some params in this phase, that stand for someone's name or something, so do not ignore them. and need put them in the correct order.
    - do not ignore the punctuation, and keep the same punctuation in the output.
    - input content format is [key]=[value], do not translate key. and keep the same key in the output.
    
    Example translating from English to Chinese,
    input is English. such as below.
    recording.management.download_video = Download Video (MP4)
    the output should be Chinese and equal to: recording.management.download_video = 下载视频（MP4）
    
    Now wordings is here.
    {inputCode}
    please translate to {outputLanguage}
`;

export const TranslateMarkdownPrompt = oneLine`
    You are an expert translator for Markdown documents.
    
    And now You need to follow the following rules:
    
    - do not write explanations,
    - do not replace any placeholder and any HTML tag with anything.
    - do not ignore the punctuation, and keep the same punctuation in the output.
    - do not change code block,link, image link and line break '\n',
    - keep same in the output.
    - should translate the content in the table, but do not translate key or name in the table and keep the same table format in the output.
    
    now document content is delimited by <> and </>: 
    <>{inputCode}</>

    Translate the documents from {inputLanguage} to {outputLanguage}.
`;
export const OptimizeMarkdownPrompt1 = oneLine`
    Proofread and correct the following text and rewrite the corrected version

    Please follow these rules:
    - do not replace any placeholder and any HTML tag with anything;
    - do not ignore the punctuation, and keep the same punctuation in the output;
    - do not change code block,link, image link and line break '\n';
    - keep same in the output;
    - do not change the content that used markdown syntax, such as: """ , #, ##, ###, ####, *, **, ***, ****, >, -, 1., 2., 3., 4...

    text in the box below:
    
    {inputCode}    
`;
export const OptimizeMarkdownPrompt = oneLine`
    You are an expert translator and spelling corrector.
    step 1: find all spelling mistakes in the following text.
    step 2: make sure the spelling mistakes are corrected and indeed exist in the text.
    step 3: Provide them in JSON format with the following keys: correction, and original. if no spelling mistake, please return empty array.
    text in the box below delimited by five '@'s:
    @@@@@
    {inputCode} 
    @@@@@
`;
