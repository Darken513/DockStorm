The goal of this project is to reach the following spec:
--------------------------------------------------------

**Multiple dockings**

usecase 1 (one-to-one):
  - select receptor
  - select ligand
  - select sites ( 1+ )

usecase 2 (one-to-many):
  - select receptor
  - select ligands ( 1+ )
  - select sites ( 1+ )
 
--------------------------------------------------------

**Processes visualization**

usecase 1 (current):
  - show currently running docking instance details
  - show percentage for the currently running instace
  - give the user the capability to kill the running process

usecase 2 (next):
  - show all schedualed docking instances
  - give the user the right to cancel instances
  - give the user the right to change order
  
--------------------------------------------------------
  
**Global Configuration**

- configure how many cpus the app should use
- configure default values ( range exau )
- configure output path

--------------------------------------------------------

**Result visualization**

- display results ( will specify the spec later )
- Tree mode for easy navigation

--------------------------------------------------------

**track fails & schedualed**

- say the user schedualed 10 dockings and the he closes 
  machine, the app should keep track of those instances
  the next time the user opens the app it asks if the last
  schedualed instance are still desired
  
--------------------------------------------------------
