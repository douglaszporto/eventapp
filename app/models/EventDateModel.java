package models;

import java.util.*;
import javax.persistence.*;

import play.db.jpa.*;

@Entity
public class EventDateModel extends Model{

	public String  title;
	public String  description;
	public String  local;
	public Date    eventdate;
	public String  eventtime;
	public Integer remind;

	public EventDateModel(){
		this.title       = "";
		this.description = "";
		this.local       = "";
		this.eventdate   = new Date();
		this.eventtime   = "";
		this.remind      = 2;
	}

	public EventDateModel(String pTitle, String pDesc, String pLocal, 
		                  Date pDate, String pTime, Integer pRemind){
		this.title       = pTitle;
		this.description = pDesc;
		this.local       = pLocal;
		this.eventdate   = pDate;
		this.eventtime   = pTime;
		this.remind      = pRemind;
	}
}