import { useState } from 'react';
import { Text, Box } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCancel, faCheck, faCross, faLock } from '@fortawesome/free-solid-svg-icons';



export function PasswordRequirement({ meets, label }: { meets: boolean; label: string }) {
  return (
    <Text
      color={meets ? 'teal' : 'red'}
      sx={{ display: 'flex', alignItems: 'center' }}
      mt={7}
      size="sm"
    >
      {meets ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faCancel} />} <Box ml={10}>{label}</Box>
    </Text>
  );
}

export const requirementsPassword = [
  { re: /[0-9]/, label: 'Includes number' },
  { re: /[a-z]/, label: 'Includes lowercase letter' },
  { re: /[A-Z]/, label: 'Includes uppercase letter' },
  { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol' },
];

export function getStrength(password: string) {
  let multiplier = password.length > 5 ? 0 : 1;

  requirementsPassword.forEach((requirement) => {
      if (!requirement.re.test(password)) {
      multiplier += 1;
      }
  });

  return Math.max(100 - (100 / (requirementsPassword.length + 1)) * multiplier, 10);
}

