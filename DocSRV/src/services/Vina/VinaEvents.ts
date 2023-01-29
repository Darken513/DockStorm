enum InstanceEvents {
    PERCENTAGE = 'percentage',
    SPLIT = 'split',
    KILL = 'kill',
    CLOSED = 'closed',
}

enum SchedulerEvents {
    SCHEDULED = 'scheduled',
    STARTED = 'started',
    LOOP = 'loop',
    FINISHED = 'finished',
    PERCENTAGE = 'percentage',
    ALLDONE = 'allDone',
    ALERT = 'alert',
}

export { InstanceEvents, SchedulerEvents }