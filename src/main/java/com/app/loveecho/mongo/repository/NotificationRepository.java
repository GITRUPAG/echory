package com.app.loveecho.mongo.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.app.loveecho.mongo.document.Notification;

public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findByReceiverIdOrderByCreatedAtDesc(String receiverId);

    long countByReceiverIdAndReadFalse(String receiverId);
}
