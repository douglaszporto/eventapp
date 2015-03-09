package models;

import java.util.*;
import javax.persistence.*;

import play.db.jpa.*;

@Entity
public class EventDateModel extends Model {

	public String title;
	public String description;
	public String local;
	public Date eventDate;
	public String eventTime;
	public Integer remind;

	@OneToMany(cascade = { CascadeType.ALL })
	public List<UserModel> participants;

	public EventDateModel() {
		this.title = "";
		this.description = "";
		this.local = "";
		this.eventDate = new Date();
		this.eventTime = "";
		this.remind = 2;
		this.participants = new ArrayList<UserModel>();
	}

	public EventDateModel(String pTitle, String pDesc, String pLocal,
			Date pDate, String pTime, Integer pRemind,
			List<UserModel> pParticipants) {
		this.title = pTitle;
		this.description = pDesc;
		this.local = pLocal;
		this.eventDate = pDate;
		this.eventTime = pTime;
		this.remind = pRemind;
		this.participants = pParticipants;
	}

	public void setParticipants(List<UserModel> participants) {
		this.participants = participants;
	}
}