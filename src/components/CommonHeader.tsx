import { faArrowCircleLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Divider } from "@mantine/core";
import * as React from "react";
import { useNavigate } from "react-router-dom";

export interface ICommonHeaderProps {
  title: string;
  backButton?: boolean;
  children?: React.ReactNode;
}

export function CommonHeader(props: ICommonHeaderProps) {
  const navigate = useNavigate();

  return (
    <div>
      <div className="d-flex flex-row justify-content-between align-items-center flex-wrap">
        <div className="d-flex flex-row align-items-center">
            {props.backButton ? (
                <Button
                    leftIcon={<FontAwesomeIcon icon={faArrowCircleLeft} />} 
                    color="red"
                    onClick={() => navigate(-1)}
                    className="mr-2"
                    size="xs"
                >
                    Back
                </Button>
            ) : null}
            <div className="d-flex flex-row justify-content-start">
            <h2>{props.title}</h2>
            </div>
        </div>
        <div>
            {props.children && props.children}
        </div>
      </div>
      <Divider />
    </div>
  );
}
