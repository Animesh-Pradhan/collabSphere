import { Alert, Box } from '@chakra-ui/react';
import React from 'react';
import { MdClose } from 'react-icons/md';

type Props = {
    status?: "error" | "info" | "success" | "warning" | "neutral";
    variant?: "outline" | "solid" | "subtle" | "surface";
    title: string;
    description?: string;
    onClose?: () => void;
};

const UIAlert: React.FC<Props> = ({ status = 'error', variant = 'surface', title, description, onClose }) => {
    return (
        <Alert.Root status={status} variant={variant} alignItems={'center'}>
            <Alert.Indicator />
            <Alert.Content color="fg">
                <Alert.Title>{title}</Alert.Title>
                {description && <Alert.Description>{description}</Alert.Description>}
            </Alert.Content>

            {onClose && <Box cursor={'pointer'} onClick={onClose}><MdClose /></Box>}
        </Alert.Root>
    );
};

export default UIAlert;