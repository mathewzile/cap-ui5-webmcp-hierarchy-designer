using {cuid} from '@sap/cds/common';

namespace sap.capire.bookshop;

entity Genres : cuid {
  parent   : Association to Genres;
  children : Composition of many Genres
               on children.parent = $self;
  name     : localized String;
}
