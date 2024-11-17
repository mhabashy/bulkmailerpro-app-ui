import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Modal } from "@mantine/core";
import { DatePickerInput, TimeInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import dayjs from "dayjs";

export const ScheduleModal = ({ opened, setOpened, submitForm} : { opened: boolean, setOpened: Function, submitForm: Function}) => {

    const formSchedule = useForm({
        initialValues: {
            date: null,
            time: null
        },
        validate: {
            date: (value) => value === null ? 'Date is required' : undefined,
            time: (value) => value === null ? 'Time is required' : undefined
        }
    });

    const currentTime = dayjs().toDate();
    

    return <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Schedule Email"
        padding="xl"
    >
        <form onSubmit={formSchedule.onSubmit((v: any) => {
            const d = dayjs(v.date).set('hour', new Date(v.time).getHours()).set('minute', new Date(v.time).getMinutes());                    
            if (d.isBefore(v.time)) {
                showNotification(
                    {
                        title: 'Error',
                        message: 'Time must be greater than current time',
                    }
                );
            } else {
                // sendTime = d.toDate();
                // setOpenedSchedule(false);
                // setOpenedComplate(true);
                // send();
                submitForm(formSchedule.values);
            }
        })}>
            <DatePickerInput placeholder="Pick date" 
                        minDate={currentTime}
                        label="Send date" 
                        required
                        {...formSchedule.getInputProps('date')}
                        mx="auto"
                        maw={400}
                        maxDate={dayjs().add(16, 'days').toDate()}
                        popoverProps={{ zIndex: 100000, withinPortal: true }} 
                        />
            <TimeInput placeholder="Pick time"
                        label="Send time" 
                        required 
                        {...formSchedule.getInputProps('time')}
                        />
            <Button
                className="w-100 mt-2"
                type="submit"
                leftIcon={<FontAwesomeIcon icon={faCalendarAlt} />}
            >
                Set Email Event
            </Button>            
        </form>
    </Modal>;
};