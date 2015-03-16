package models;

import java.util.*;
import javax.persistence.*;

import play.db.jpa.*;

@Entity
public class GroupModel extends Model {

	public String name;

	@OneToMany(cascade = { CascadeType.ALL })
	@JoinColumn(name="group_id")
	public List<UserModel> participants;

	public GroupModel() {
		this.name = "";
		this.participants = new ArrayList<UserModel>();
	}

	public GroupModel(String pName, List<UserModel> pParticipants) {
		this.name = pName;
		this.participants = pParticipants;
	}

	public void setParticipants(List<UserModel> pParticipants) {
		this.participants = pParticipants;
	}
}