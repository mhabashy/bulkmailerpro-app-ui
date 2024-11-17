
type TextDescriptions = {
    [key: string]: {
        [locale: string]: string;
    };
};

export const textDescriptions: TextDescriptions = {
    'bulkmailer': {
        'en-US': 'Create and send bulk email campaigns to your selected recipient groups.',
        'es-US': 'Cree y envíe campañas de correo electrónico masivas a los grupos de destinatarios seleccionados.',
    },
    'groups': {
        'en-US': 'Manage your recipient lists by creating and organizing groups for targeted email campaigns.',
        'es-US': 'Administre sus listas de destinatarios creando y organizando grupos para campañas de correo electrónico dirigidas.',
    },
    'accounts': {
        'en-US': 'View and manage email accounts used for sending your campaigns.',
        'es-US': 'Vea y administre las cuentas de correo electrónico utilizadas para enviar sus campañas.',
    },
    'templates': {
        'en-US': 'Design and save email templates to reuse in your campaigns for consistent messaging.',
        'es-US': 'Diseñe y guarde plantillas de correo electrónico para reutilizar en sus campañas para mensajes consistentes.',
    },
    'organizations': {
        'en-US': 'Manage organization settings and user permissions for team collaboration.',
        'es-US': 'Administre la configuración de la organización y los permisos de usuario para la colaboración en equipo.',
    },
    'log': {
        'en-US': 'Track email campaign activities and view detailed logs for sent emails.',
        'es-US': 'Realice un seguimiento de las actividades de la campaña de correo electrónico y vea registros detallados de los correos electrónicos enviados.',
    },
    'support': {
        'en-US': 'Access help resources and contact support for assistance with using BulkMailer.pro.',
        'es-US': 'Acceda a recursos de ayuda y póngase en contacto con el soporte para obtener ayuda con el uso de BulkMailer.pro.',
    },
}