// Shared bits for live-class warnings (staff → student).

export const WARNING_STAFF_ROLES = ['admin', 'registrar', 'course_registrar', 'admissions_officer', 'live_monitor', 'instructor'] as const;

export const WARNING_REASONS = [
    'Camera off',
    'Not paying attention',
    'Not responding when called',
    'Disruptive behaviour',
    'Late to class',
    'Left the class early',
    'Wrong name on Zoom',
    'Other',
] as const;
