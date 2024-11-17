import { faBoltLightning, faImage, faMobileScreenButton, faPaperclip } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Group, Modal, Select, Text } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE, MS_EXCEL_MIME_TYPE, MS_POWERPOINT_MIME_TYPE, MS_WORD_MIME_TYPE, PDF_MIME_TYPE } from "@mantine/dropzone";
import { notifications, showNotification } from "@mantine/notifications";
import { Editor } from "@tinymce/tinymce-react";
import _ from "lodash";
import { useEffect, useRef, useState } from "react";
import { ATTACHMENT_STATUS } from "../../modals/attachents.modals";
import './html-editor.scss';
import { InsertHTMLButton } from "./insertHTMLButton";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { firebaseApp } from "../../config";

function bytesToMegaBytes(bytes: number) { 
    return bytes / (1024*1024); 
}

export const DropzoneChildren = () => (
    <Group position="center" spacing="xl" style={{ minHeight: 220, pointerEvents: 'none' }}>
        <div>
            <Text size="xl" inline>
                Drag image here or click to select image
            </Text>
            <Text size="sm" color="dimmed" inline mt={7}>
                Insert image to the editor
            </Text>
        </div>
    </Group>
);

export const DropzoneFileChildren = () => (
    <Group position="center" spacing="xl" style={{ minHeight: 220, pointerEvents: 'none' }}>
        <div>
            <Text size="xl" inline>
                Drag file here or click to select file
            </Text>
            <Text size="sm" color="dimmed" inline mt={7}>
                Attach as many files as you like, each file should not exceed 25mb
            </Text>
        </div>
    </Group>
)

function ImageDropZone(params: any) {
    const bucketName = params.permanent ? import.meta.env.VITE_STORAGE_BUCKET_TEMPLATE : import.meta.env.VITE_STORAGE_BUCKET_TEMP;
    const orgId = localStorage.getItem('defaultOrgUID');
    const storage = getStorage(firebaseApp, bucketName);
    const fileUrl = params.permanent ? import.meta.env.VITE_TEMPLATE_FILE_PATH : import.meta.env.VITE_TEMP_FILE_PATH;
    return (
        <Dropzone
            onDrop={async (files) => {
                _.forEach(files, async (file, _) => {
                    if (bytesToMegaBytes(file.size) > 3) {
                        showNotification(
                            {
                                title: 'Error',
                                message: `Error: ${file.name} size is too large to attach. Maximum size is 3mb.`,
                            }
                        );
                        return;
                    }
                    const tempFileName = `${file.name.split('.')[0]}-${new Date().getTime()}.${file.name.split('.')[1]}`;
                    uploadBytes(ref(storage, `${orgId}/${tempFileName}`), file).then((t: any) => {
                        params.insertIntoEditor(`<img src="${fileUrl}/${orgId}/${tempFileName}" />`);
                    }).catch((e: any) => {
                        showNotification(
                            {
                                title: 'Error',
                                message: `Error: ${file.name} failed to upload.`,
                            }
                        );
                    }).finally(() => {
                        params.close();
                    });
                });
            }}
            onReject={(_) => {
                showNotification(
                    {
                        title: 'Error',
                        message: 'Error: adding image',
                    }
                );
            }}
            maxSize={3 * 1024 ** 2}
            accept={IMAGE_MIME_TYPE}
        >
            <DropzoneChildren />
        </Dropzone>
    );
}

function FileDropZone(params: any) {
    return (
        <Dropzone
            onDrop={(files) => {
                const filesRan: any[] = [];
                Promise.all(files.map((file: File) => {
                    if (bytesToMegaBytes(file.size) > 25) {
                        showNotification(
                            {
                                title: 'Error',
                                message: `Error: ${file.name} size is too large to attach. Maximum size is 25mb.`,
                            }
                        );
                        return;
                    } else {
                        filesRan.push({
                            status: ATTACHMENT_STATUS.PENDING,
                            file: file,
                            filename: file.name,
                            path: null,
                        });
                    }

                })).finally(() => {
                    params.attachment(filesRan);
                    params.close();
                });
            }}
            onReject={(files) => {
                for (const file of files) {
                    if (bytesToMegaBytes(file.file.size) > 25) {
                        showNotification(
                            {
                                title: 'Error',
                                message: `Error: ${file.file.name} size is too large to attach. Maximum size is 25mb.`,
                            }
                        );
                    } else {
                        showNotification(
                            {
                                title: 'Error',
                                message: `Error: ${file.file.size} failed to upload.`,
                            }
                        );
                    }
                }
            }}
            maxSize={25 * 1024 ** 2}
            accept={_.concat(
                IMAGE_MIME_TYPE,
                PDF_MIME_TYPE,
                MS_WORD_MIME_TYPE,
                MS_EXCEL_MIME_TYPE,
                MS_POWERPOINT_MIME_TYPE,
            )}
        >
            <DropzoneFileChildren />
        </Dropzone>
    );
}

function HTMLEditorButton(params: any) {
    const [openTemplateText, setOpenTemplateText] = useState(false);
    const [openTemplateImage, setOpenTemplateImage] = useState(false);
    const [openTemplateFile, setOpenTemplateFile] = useState(false);
    const [openTemplateButtonInsert, setOpenTemplateButtonInsert] = useState(false);
    const [templateText, setTemplateText] = useState(null);
    const phrases = [
        {
            phrase: "[[firstName]]",
            name: "First Name",
        },
        {
            phrase: "[[lastName]]",
            name: "Last Name",
        },
        {
            phrase: "[[fullName]]",
            name: "Full Name",
        },
        {
            phrase: "[[email]]",
            name: "Email",
        },
        {
            phrase: "[[specialIdentifier]]",
            name: "Special Identifier",
        }
    ];

    return (
        <>
            <InsertHTMLButton
                open={openTemplateButtonInsert}
                setClose={() => setOpenTemplateButtonInsert(false)}
                insertIntoEditor={(v: string | null) => params.insertIntoEditor(v)}
            />
            <Modal
                opened={openTemplateText}
                onClose={() => setOpenTemplateText(false)}
                title="Add Dynamic Text (replace selected text)"
            >
                <Select
                    label="Select Dynamic Template"
                    className="mb-4"
                    onChange={(e: any) => setTemplateText(e)}
                    withinPortal={true}
                    data={phrases.map((p: any) => {
                        return {
                            label: p.name,
                            value: p.phrase
                        }
                    })}
                ></Select>
                <div className="w-100 d-flex justify-content-end">
                    <Button
                        onClick={() => { params.insertIntoEditor(templateText); setOpenTemplateText(false); }}
                    >
                        Add
                    </Button>
                </div>
            </Modal>
            <Modal
                opened={openTemplateImage}
                onClose={() => setOpenTemplateImage(false)}
                title="Add Image"
            >
                <ImageDropZone close={() => setOpenTemplateImage(false)} {...params} />
            </Modal>
            <Modal
                opened={openTemplateFile}
                onClose={() => setOpenTemplateFile(false)}
                title="Add File"
            >
                <FileDropZone close={() => setOpenTemplateFile(false)} {...params} />
            </Modal>
            <div className="d-flex flex-row flex-wrap mt-2 mb-2">
                <Button
                    color="orange"
                    onClick={() => setOpenTemplateImage(true)}
                    leftIcon={<FontAwesomeIcon icon={faImage} />}
                    className="mr-2 mb-2"
                >Insert Image</Button>
                <Button
                    leftIcon={<FontAwesomeIcon icon={faBoltLightning} />}
                    color="orange"
                    onClick={() => setOpenTemplateText(true)}
                    className="mr-2 mb-2"
                >Dynamic Text</Button>
                <Button
                    leftIcon={<FontAwesomeIcon icon={faMobileScreenButton} />}
                    color="orange"
                    onClick={() => setOpenTemplateButtonInsert(true)}
                    className="mr-2 mb-2"
                >Add HTML Button</Button>
                {params.allowAttachments &&
                    <Button
                        leftIcon={<FontAwesomeIcon icon={faPaperclip} />}
                        color="orange"
                        onClick={() => setOpenTemplateFile(true)}
                        className="mr-2 mb-2"
                    >Attached File</Button>
                }
            </div>
        </>
    )
}

function HTMLEditor(params: any) {
    const [content, setContent] = useState('');
    const editorRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setContent(params.html);
        params.setContent(params.html);
    }, [params.html]);

    function insertIntoEditor(phrase: string | null) {
        // @ts-ignore
        editorRef.current?.selection.setContent(phrase);
        if (params.setContent) {
            // @ts-ignore
            params.setContent(editorRef.current?.getContent());
        }
    }

    return (
        <>
            <HTMLEditorButton
                insertIntoEditor={insertIntoEditor}
                {...params}
            ></HTMLEditorButton>
            <div className="mailer-box">
                <Editor
                    // @ts-ignore
                    onInit={(_: any, editor: any) => editorRef.current = editor}
                    initialValue={content}
                    apiKey={import.meta.env.VITE_TINY_KEY}
                    onBlur={(_: any) => {
                        console.log(`blur`);
                        // @ts-ignore
                        params.setContent(editorRef.current?.getBody().innerHTML);
                    }}
                    onChange={(_: any) => {
                        // @ts-ignore
                        params.setContent(editorRef.current?.getBody().innerHTML);
                    }}
                    init={{
                        height: 640,
                        menubar: false,
                        plugins: [
                            'preview', 'importcss', 'searchreplace', 'autolink', 'autosave', 'save', 'directionality', 'code', 'visualblocks', 'visualchars', 'fullscreen', 'image', 'link', 'media', 'template', 'codesample', 'table', 'charmap', 'pagebreak', 'nonbreaking', 'anchor', 'insertdatetime', 'advlist', 'lists', 'wordcount', 'help', 'charmap', 'quickbars', 'emoticons'
                        ],
                        toolbar1: 'undo redo | bold italic underline strikethrough | fontfamily fontsize blocks | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons',
                        toolbar2: 'insertfile image link anchor | table layer legacyoutput | code codesample | fullscreen preview print | ltr rtl',
                        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                    }}
                />
            </div>
        </>
    );
}

export default HTMLEditor;

