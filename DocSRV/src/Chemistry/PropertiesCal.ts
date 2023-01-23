import * as rdkit from 'rdkit';

const molFile = '"C:\\Users\\Darken\\Desktop\\docking\\glibenglamide with PPARAY\\ligand.mol"';

// read in mol file
const molecule = rdkit.mo.readFileSync(molFile);

// calculate molecular weight
const mw = rdkit.Descriptors.MolWt(molecule);
console.log("Molecular weight:", mw);

// calculate number of heavy atoms
const nha = rdkit.Descriptors.HeavyAtomCount(molecule);
console.log("Number of heavy atoms:", nha);

// calculate logP
const logp = rdkit.Descriptors.MolLogP(molecule);
console.log("logP:", logp);

// calculate number of rotatable bonds
const nrb = rdkit.Descriptors.NumRotatableBonds(molecule);
console.log("Number of rotatable bonds:", nrb);