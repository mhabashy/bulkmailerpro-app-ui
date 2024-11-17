import GjsEditor from '@grapesjs/react';
import './styles.scss';
import type { Editor } from 'grapesjs';
import { Button, Flex } from '@mantine/core';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { LogoRows } from '../../components/LogoRow';
import { templateStore } from '../../store/templateStore';
import { useNavigate } from 'react-router-dom';

export default function AdvanceEditingGrapsJS() {
  const [mainEditor, setMainEditor] = useState<Editor | null>(null);
  const navigator = useNavigate();
  const onEditor = (editor: Editor) => {
    setMainEditor(editor);
    const template = localStorage.getItem('template');
    if (template)
      editor.setComponents(template?.toString());
  };
  const updateTemplate = templateStore((state: any) => state.updateTemplate);

  return (
    <>
      <Flex direction="row" p="lg" justify="space-between" >
        <div style={{ height: "50px", width: "200px" }}>
          <LogoRows />
        </div>
        <Button onClick={() => {
          if (mainEditor) {
            const templateId = localStorage.getItem('templateId');
            if (templateId) {
              updateTemplate(templateId, {
                body: mainEditor.getHtml(),
              });
              navigator(-1);
            }
          }
        }}
        leftIcon={<FontAwesomeIcon icon={faSave} />}
        >Save</Button>
      </Flex>
      <GjsEditor
        grapesjs="https://unpkg.com/grapesjs"
        grapesjsCss="https://unpkg.com/grapesjs/dist/css/grapes.min.css"
        options={{
          height: '100vh',
          storageManager: false,
        }}
        onChange={(html) => {
          console.log(html);
        }}
        plugins={[
          {
            id: 'gjs-blocks-basic',
            src: 'https://unpkg.com/grapesjs-blocks-basic',
          },
        ]}
        onEditor={onEditor}
      />
    </>
  );
}
