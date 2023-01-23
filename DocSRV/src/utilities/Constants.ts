/**
* VINA_CONF_KEYWORDS is a list of keywords that are used in the AutoDock Vina configuration file.
* These keywords are used to identify the configuration parameters and their values in the file.
*
* receptor - The receptor file path.
*
* flex - The flexible side chains file path.
*
* ligand - The ligand file path.
*
* out - The output file path.
*
* log - The log file path.
*
* center_x - The x-coordinate of the center of the search space.
*
* center_y - The y-coordinate of the center of the search space.
*
* center_z - The z-coordinate of the center of the search space.
*
* size_x - The size of the search space in the x-axis, default is 20.
*
* size_y - The size of the search space in the y-axis, default is 20.
*
* size_z - The size of the search space in the z-axis, default is 20.
*
* energy_range - The energy range for the search, default is 3.
*
* exhaustiveness - The exhaustiveness of the search, default is 8.
*
* num_modes - The number of modes to be generated, default is 9.
*
* cpu - The number of cpu to be used for the search.
*/
const VINA_CONF_KEYWORDS = [
    'receptor',
    'flex',
    'ligand',
    'out',
    'log',
    'center_x',
    'center_y',
    'center_z',
    'size_x',
    'size_y',
    'size_z',
    'energy_range',
    'exhaustiveness',
    'num_modes',
    'cpu',
]

export { VINA_CONF_KEYWORDS }