/**
 * TypeScript interfaces converted from VB6 database tables / JPA entities.
 * Mirrors Spring Boot entity classes.
 */

export interface Project {
  projectNum: string;
  customer: string;
  addr1: string;
  addr2: string;
  city: string;
  stateOrProv: string;
  country: string;
  zip: string;
  dateOfIssue: string;
  eqId: number | null;
  earthquakeZone?: string;
  floorHeight: number;
  rise?: number;
  projectGroup?: string;
  userName: string;
  completed: boolean;
  appendix: string;
  specification: string;
  workOrder: string;
  clarifyCaseId: string;
  partGroupId: number;
  contacts?: ProjectContact[];
}

export interface WorkItem {
  workItemId: number;
  workItemNum: number;
  projectNum: string;
  workOpId: number;
  workOpDesc?: string;
  workItemText: string;
  category: string;
  parts?: ProjectPart[];
  lineups?: { lineup: string; startBay: string; endBay: string }[];
  additionalParts?: ProjectPart[];
}

export interface ProjectPart {
  projPartId: number;
  partId: number;
  qty: number;
  workItemId: number;
  partDesc?: string;
  partNum?: string;
  masterPart?: MasterPart;
}

export interface MasterPart {
  partId: number;
  itemId: string;
  oracleItemId: string;
  partDesc: string;
  orderParm: string;
  partNum: string;
  vendorCompanyId: number;
  mfrCompanyId: number;
  cost: number;
  uom: string;
  categoryId: number;
  kit: boolean;
  active: boolean;
  partGroupId: string;
  // Enriched display names (populated by backend join)
  vendorName?: string;
  manufacturerName?: string;
  categoryName?: string;
  partGroupName?: string;
}

export interface ComponentPart {
  compPartId: number;
  partId: number;
  assocPartId: number;
  qty: number;
  eqId: number;
  // Enriched display names (populated by backend join)
  masterComponentDesc?: string;
  associatedPartDesc?: string;
  zoneDesc?: string;
}

export interface RunListEntry {
  runId: number;
  projectNum: string;
  runSeq: number;
  runlistCatId: number;
  color: string;
  length: number;
  numCables: number;
  cableTypeId: number;
  desig: string;
  fromPartId: number;
  fromLoc: string;
  panel: string;
  circuitBrkrPos: string;
  toPartId: number;
  toLoc: string;
  runlistTxt: string;
  circuitBrkrCap: number;
  equipmentDrain: number;
}

export interface ProjectContact {
  projectContactId: number;
  projectNum: string;
  title: string;
  firstName: string;
  lastName: string;
  addr1: string;
  addr2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  fax: string;
  email: string;
}

export interface InstallerNote {
  noteId: number;
  projectNum: string;
  noteNum: number;
  noteTxt: string;
}

export interface TableOfContents {
  contentsId: number;
  sectNum: number;
  sectName: string;
  sectDesc: string;
  itemDesc: string;
  show: boolean;
}

export interface TOCViewData {
  project: Project;
  sections: TableOfContents[];
  installerNotes: InstallerNote[];
}

export interface DISViewData {
  project: Project;
  contacts: ProjectContact[];
}

export interface UserSecurity {
  userName: string;
  ctlId: string;
  userAccess: boolean;
  dataAdmin: boolean;
  projAdmin: boolean;
  costAdmin: boolean;
  userAdmin: boolean;
}

export interface Company {
  companyId: number;
  companyName: string;
}

export interface MaterialCategory {
  catId: number;
  category: string;
}

export interface EarthquakeZone {
  eqId: number;
  eqType: string;
}

export interface WorkOperationType {
  workOpId: number;
  workOpDesc: string;
}

export interface RunListCategory {
  runlistCatId: number;
  category: string;
  voltageDrop: number;
}

/** Admin run list association (frmAdmRunListAssoc) — includes resolved display names */
export interface RunListAssociation {
  fromToId: number;
  runlistCatId: number;
  runlistCategory: string;
  fromPartId: number;
  fromPartDesc: string;
  toPartId: number;
  toPartDesc: string;
}

export interface CableType {
  cableTypeId: number;
  cableDesc: string;
  circularMills: number;
  runlistCatId: number;
}

export interface ColorDesignation {
  colorDesigId: number;
  color: string;
  desig: string;
}

export interface PartGroup {
  partGroupId: string;
  partGroupName: string;
}
export interface UnitOfMeasure {
  uomId?: number;
  uomType: string;
}

export interface InventoryDateItem {
  itemNum: number;
  vendor: string;
  partNum: string;
  sapItemId: string;
  description: string;
  quantity: number;
  uom: string;
  dateReceived: string | null;
}

export interface InventoryDateViewData {
  project: Project;
  items: InventoryDateItem[];
}

export interface TitlePageViewData {
  project: Project;
}
export interface LoginResponse {
  token: string;
  userName: string;
  cuid?: string;
  givenName?: string;
  userAccess: boolean;
  dataAdmin: boolean;
  projAdmin: boolean;
  costAdmin: boolean;
  userAdmin: boolean;
  error?: string;
}
