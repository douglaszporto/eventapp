package controllers;

import play.*;
import play.mvc.*;

import java.util.*;

import models.*;
import classes.*;

public class Group extends Controller {

	public static void list() {
		List<GroupModel> events = GroupModel.find("ORDER BY id ASC")
				.fetch();
		renderJSON(events, GroupSerializer.getInstance());
	}

	public static void load(Long id) {
		GroupModel group = GroupModel.findById(id);

		if (group == null) {
			error("Não encontrado Grupo ID #" + id);
		} else {
			renderJSON(group, GroupSerializer.getInstance());
		}
	}

	public static void delete(Long id) {
		GroupModel group = GroupModel.findById(id);

		if (group == null) {
			error("Não encontrado Grupo ID #" + id);
		} else {
			group.delete();
			renderText("1");
		}
	}

	public static void save(GroupModel group, List<UserModel> participants) {
		group.setParticipants(participants);
		group.save();

		if (group != null) {
			renderJSON(group, GroupSerializer.getInstance());
		} else {
			error("Não foi possível inserir o Grupo");
		}
	}

	public static void addParticipant(long id, UserModel participant){
		GroupModel group = GroupModel.findById(id);

		if (group != null) {
			if(participant.email != "") {

				group.participants.add(participant);
				group.save();

				renderJSON(participant);
			} else {
				error("O email não pode ser vazio");
			}
		} else {
			error("O grupo #" + id + " não existe");
		}
	}

	public static void removeParticipant(long id, long emailId){
		GroupModel group = GroupModel.findById(id);
		Integer index = 0;

		if (group != null) {
			for(UserModel user : group.participants) {
				if(user.id == emailId) {
					user.delete();
					renderText("1");
				}
				index++;
			}
		} else {
			error("O grupo #" + id + " não existe");
		}
	}

}