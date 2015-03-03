package models;

import java.util.*;
import javax.persistence.*;

import play.db.jpa.*;

@Entity
public class EventDateModel extends Model{

	public String  title;
	public String  desc;
	public String  local;
	public Date    date;
	public String  time;
	public Integer remind;

	public EventDateModel(){
		this.title  = "";
		this.desc   = "";
		this.local  = "";
		this.date   = new Date();
		this.time   = "";
		this.remind = 2;
	}

	public EventDateModel(String pTitle, String pDesc, String pLocal, Date pDate, String pTime, Integer pRemind){
		this.title  = pTitle;
		this.desc   = pDesc;
		this.local  = pLocal;
		this.date   = pDate;
		this.time   = pTime;
		this.remind = pRemind;
	}
}