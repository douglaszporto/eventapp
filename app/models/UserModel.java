package models;

import java.util.*;
import javax.persistence.*;

import play.db.jpa.*;

@Entity
public class UserModel extends Model {

	public String email;

	@ManyToOne
    @JoinColumn(name="group_id")
    public GroupModel group;


	public UserModel() {
		this.email = "";
	}

	public UserModel(String pEmail) {
		this.email = pEmail;
	}
}