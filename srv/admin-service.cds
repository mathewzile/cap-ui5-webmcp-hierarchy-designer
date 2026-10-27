using {sap.capire.bookshop as my} from '../db/schema';

service AdminService {
  @hierarchy
  entity Genres as projection on my.Genres;

  action purgeNonFiction();
}
