import { faMobileButton } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ColorPicker, Divider, Input, Modal, NumberInput, TextInput } from '@mantine/core';
import { useForm } from "@mantine/form";


export interface IInsertHTMLButtonProps {
    setClose: (close: boolean) => void;
    insertIntoEditor: (html: string | null) => void;
    open: boolean;
}

export function InsertHTMLButton (props: IInsertHTMLButtonProps) {
  const { setClose, insertIntoEditor, open } = props;

  const form = useForm({
      initialValues: { 
          link: 'https://',
          buttonLabel: '',
          textColor: '#ffffff',
          backgroundColor: '#00ff22',
          padding: 10,
          margin: 10,
          borderRadius: 5,
      },
      validate: {
        link: (value) => ((/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm).test(value) ? null : 'Link is not valid'),
        buttonLabel: (value) => (value?.length > 0 ? null : 'Button label is required'),
        textColor: (value) => (value?.length > 0 ? null : 'Text color is required'),
        backgroundColor: (value) => (value?.length > 0 ? null : 'Background color is required'),
        padding: (value) => (value ? null : 'Padding is required'),
        margin: (value) => (value ? null : 'Margin is required'),
        borderRadius: (value) => (value ? null : 'Border radius is required'),
      }
  });

  const generateHTML = () => {
    return `
      <a href="${form.values.link}" target="_blank" rel="noopener noreferrer"
        style="background-color:${form.values.backgroundColor}; color: ${form.values.textColor}; 
               padding: ${form.values.padding}px; margin: ${form.values.padding}px; text-decoration: none;
               border-radius: ${form.values.borderRadius}px;">
        ${form.values.buttonLabel}
      </a>
    `;
  }

  return (
     <Modal
        opened={open}
        onClose={() => setClose(false)}
        title="Insert HTML Button"
        padding="xl"
        size="xl"
     >
       <form onSubmit={
          form.onSubmit(() => {
            if (!form.validate().hasErrors) {
              
              insertIntoEditor(generateHTML()); 
              setClose(false); form.reset();
            }
          })
        }>
        <TextInput
          placeholder="Link (URL) e.g. https://www.example.com"
          label="Link"
          required
          {...form.getInputProps('link')}
        />
        <TextInput
          placeholder="Button Label"
          label="Button Label"
          required
          {...form.getInputProps('buttonLabel')}
        />
        <Input.Wrapper label="Text Color" className='mt-2 mb-2'>
          <ColorPicker
            {...form.getInputProps('textColor')}
          />
        </Input.Wrapper>
        <Input.Wrapper label="Background Color" className='mt-2 mb-2'>
          <ColorPicker
            {...form.getInputProps('backgroundColor')}
          />
        </Input.Wrapper>
        <NumberInput
          placeholder="Padding in pixels"
          label="Padding"
          required
          min={0}
          {...form.getInputProps('padding')}
        />
        <NumberInput
          placeholder="Margin in pixels"
          label="Margin"
          required
          min={0}
          {...form.getInputProps('margin')}
        />
        <NumberInput
          placeholder="Border radius in pixels"
          label="Border radius"
          required
          min={0}
          {...form.getInputProps('borderRadius')}
        />
        <Divider className="mb-2 mt-2" />
        <div className="d-flex align-items-center justify-content-end">
              <Button
                  leftIcon={<FontAwesomeIcon icon={faMobileButton} />}
                  color="green"
                  type="submit"
                  className="mr-2 mb-2"
              >Add Button</Button>
        </div>
       </form>
     </Modal>
  );
}
